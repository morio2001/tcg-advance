import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LINE_CHANNEL_ID = Deno.env.get('LINE_CHANNEL_ID')!
const LINE_CHANNEL_SECRET = Deno.env.get('LINE_CHANNEL_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173'

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return Response.redirect(`${APP_URL}?error=line_auth_denied`)
  }

  if (!code) {
    // Step 1: LINEの認証ページへリダイレクト
    const mode = url.searchParams.get('mode') || 'login'
    const accessToken = url.searchParams.get('access_token') || ''

    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize')
    lineAuthUrl.searchParams.set('response_type', 'code')
    lineAuthUrl.searchParams.set('client_id', LINE_CHANNEL_ID)
    lineAuthUrl.searchParams.set('redirect_uri', `${SUPABASE_URL}/functions/v1/line-auth`)
    lineAuthUrl.searchParams.set('state', `${mode}:${accessToken}`)
    lineAuthUrl.searchParams.set('scope', 'profile openid')
    return Response.redirect(lineAuthUrl.toString())
  }

  // stateからmodeとaccessTokenを取得
  const stateParam = url.searchParams.get('state') || 'login:'
  const colonIdx = stateParam.indexOf(':')
  const mode = colonIdx >= 0 ? stateParam.substring(0, colonIdx) : 'login'
  const accessToken = colonIdx >= 0 ? stateParam.substring(colonIdx + 1) : ''

  // Step 2: codeをトークンに交換
  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${SUPABASE_URL}/functions/v1/line-auth`,
      client_id: LINE_CHANNEL_ID,
      client_secret: LINE_CHANNEL_SECRET,
    }),
  })
  const tokens = await tokenRes.json()

  if (!tokens.access_token) {
    return new Response(`LINE token error: ${JSON.stringify(tokens)}`, { status: 400 })
  }

  // Step 3: LINEプロフィール取得
  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const lineProfile = await profileRes.json()

  if (!lineProfile.userId) {
    return new Response(`LINE profile error: ${JSON.stringify(lineProfile)}`, { status: 400 })
  }

  // Step 4: Supabaseユーザー作成/取得
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // linkモード: 既存ユーザーのメタデータにLINE情報を追加
  if (mode === 'link' && accessToken) {
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    const { data: { user: currentUser } } = await supabaseUser.auth.getUser()
    if (currentUser) {
      await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
        user_metadata: {
          ...currentUser.user_metadata,
          line_user_id: lineProfile.userId,
          line_display_name: lineProfile.displayName,
        },
      })
      return Response.redirect(`${APP_URL}?line_linked=success`)
    }
    return Response.redirect(`${APP_URL}?error=line_link_failed`)
  }

  const fakeEmail = `line_${lineProfile.userId}@line.tcgadvance`

  // 既存ユーザーを確認
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  const existingUser = existingUsers?.users?.find((u) => u.email === fakeEmail)

  if (!existingUser) {
    // 新規ユーザー作成
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      email_confirm: true,
      user_metadata: {
        display_name: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl,
        line_user_id: lineProfile.userId,
        provider: 'line',
      },
    })
    if (createError) {
      return new Response(`User create error: ${createError.message}`, { status: 500 })
    }
    // プロフィール更新
    await supabaseAdmin.from('profiles').update({
      display_name: lineProfile.displayName,
      avatar_url: lineProfile.pictureUrl,
    }).eq('id', newUser!.user!.id)
  }

  // Step 5: マジックリンクでセッション作成
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: fakeEmail,
    options: { redirectTo: APP_URL },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return new Response(`Link error: ${linkError?.message}`, { status: 500 })
  }

  return Response.redirect(linkData.properties.action_link)
})
