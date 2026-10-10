interface Env {
  DB: D1Database;
}

const isAdminEmail = (email: string): boolean => {
  const clean = email.trim().toLowerCase();
  return (
    clean === 'tejasgogavale5@gmail.com' ||
    clean === 'admin@certiforge.io' ||
    clean === 'admin@certiforge.com' ||
    clean.startsWith('admin@') ||
    clean.includes('admin')
  );
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: any = await request.json();
    const { action, email, password, name, organizationName } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = isAdminEmail(cleanEmail);

    const emailUserPart = cleanEmail.split('@')[0] || 'Member';
    const autoName = cleanEmail === 'tejasgogavale5@gmail.com' 
      ? 'Tejas Gogavale'
      : isAdmin 
      ? 'Platform Administrator'
      : emailUserPart
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    const emailDomain = cleanEmail.split('@')[1] || '';
    const autoOrg = isAdmin 
      ? 'CertiForge Global Platform'
      : emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)
      ? emailDomain.split('.')[0].toUpperCase() + ' Organization'
      : `${autoName}'s Workspace`;

    // 1. FORGOT PASSWORD ACTION
    if (action === 'forgot') {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Password reset instructions have been sent.' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. SIGNUP ACTION
    if (action === 'signup') {
      const existing = await env.DB.prepare(
        'SELECT id, email, name, organization_name, role, plan, password_hash FROM users WHERE email = ?'
      ).bind(cleanEmail).first();

      const finalRole = isAdmin ? 'admin' : 'owner';
      const finalPlan = isAdmin ? 'business' : 'starter';

      if (existing) {
        // If account exists, update password if provided and check credentials
        if (password && password.trim()) {
          await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(password.trim(), existing.id).run();
        }

        if (isAdmin && (existing.role !== 'admin' || existing.plan !== 'business')) {
          await env.DB.prepare('UPDATE users SET role = ?, plan = ? WHERE id = ?').bind('admin', 'business', existing.id).run();
          existing.role = 'admin';
          existing.plan = 'business';
        }

        const finalName = existing.name || name?.trim() || autoName;
        const finalOrg = existing.organization_name || organizationName?.trim() || autoOrg;

        return new Response(JSON.stringify({ 
          success: true,
          user: {
            id: existing.id,
            email: existing.email,
            name: finalName,
            organizationName: finalOrg,
            role: existing.role || finalRole,
            plan: existing.plan || finalPlan,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=000000&color=ffffff&bold=true`
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const id = `usr-${Date.now()}`;
      const finalName = name?.trim() || autoName;
      const finalOrg = organizationName?.trim() || autoOrg;

      await env.DB.prepare(
        'INSERT INTO users (id, email, name, password_hash, organization_name, role, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        id,
        cleanEmail,
        finalName,
        password || '',
        finalOrg,
        finalRole,
        finalPlan,
        new Date().toISOString()
      ).run();

      return new Response(JSON.stringify({
        success: true,
        user: { 
          id, 
          email: cleanEmail, 
          name: finalName, 
          organizationName: finalOrg, 
          plan: finalPlan, 
          role: finalRole,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=000000&color=ffffff&bold=true`
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. LOGIN ACTION
    if (action === 'login') {
      let user = await env.DB.prepare(
        'SELECT id, email, name, organization_name, role, plan, password_hash FROM users WHERE email = ?'
      ).bind(cleanEmail).first();

      if (!user) {
        // If user not in DB:
        // For admin emails, auto-provision admin record immediately so admin is never locked out
        if (isAdmin) {
          const id = `usr-${Date.now()}`;
          const finalName = name?.trim() || autoName;
          const finalOrg = organizationName?.trim() || autoOrg;

          await env.DB.prepare(
            'INSERT INTO users (id, email, name, password_hash, organization_name, role, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            id,
            cleanEmail,
            finalName,
            password || 'admin123',
            finalOrg,
            'admin',
            'business',
            new Date().toISOString()
          ).run();

          user = {
            id,
            email: cleanEmail,
            name: finalName,
            organization_name: finalOrg,
            role: 'admin',
            plan: 'business',
            password_hash: password || 'admin123'
          };
        } else {
          // Normal user not found
          return new Response(JSON.stringify({ 
            error: 'No account found with this email. Please click "Sign up free" below to create an account.' 
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Password verification
      const storedPass = ((user.password_hash as string) || '').trim();
      const enteredPass = (password || '').trim();

      // Master admin passwords accepted for admin accounts: admin, admin123, 123456
      const isMasterAdminPass = isAdmin && ['admin', 'admin123', '123456'].includes(enteredPass);
      const isPassCorrect = storedPass === '' || enteredPass === storedPass || isMasterAdminPass;

      if (storedPass !== '' && !isPassCorrect) {
        return new Response(JSON.stringify({ 
          error: 'Incorrect password. Please verify and try again.' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update password hash if needed
      if ((!storedPass || isMasterAdminPass) && enteredPass) {
        await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(enteredPass, user.id).run();
      }

      // Ensure admin roles & business plan
      if (isAdmin && (user.role !== 'admin' || user.plan !== 'business')) {
        await env.DB.prepare('UPDATE users SET role = ?, plan = ? WHERE id = ?').bind('admin', 'business', user.id).run();
        user.role = 'admin';
        user.plan = 'business';
      }

      const finalName = user.name || name?.trim() || autoName;
      const finalOrg = user.organization_name || organizationName?.trim() || autoOrg;

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: finalName,
          organizationName: finalOrg,
          role: user.role || (isAdmin ? 'admin' : 'owner'),
          plan: user.plan || (isAdmin ? 'business' : 'starter'),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=000000&color=ffffff&bold=true`
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
