import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── 사용자 라우트 ──────────────────────────────────────
  if (pathname === '/login') {
    if (user) {
      return NextResponse.redirect(new URL('/mypage', request.url))
    }
    return supabaseResponse
  }

  if (pathname.startsWith('/mypage')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // ── 어드민 라우트 ─────────────────────────────────────
  if (pathname === '/admin/login') {
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return supabaseResponse
  }

  if (pathname === '/admin/set-password') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut()
    const url = new URL('/admin/login', request.url)
    url.searchParams.set('error', 'inactive')
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin/members') && profile.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/mypage/:path*'],
}
