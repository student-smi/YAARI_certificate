interface Env {
  DB: D1Database;
}

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

    // Helper to format clean name from email
    const cleanEmail = email.trim().toLowerCase();
    const emailUserPart = cleanEmail.split('@')[0] || 'Member';
    const autoName = emailUserPart
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
    
    const emailDomain = cleanEmail.split('@')[1] || '';
    const autoOrg = emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)
      ? emailDomain.split('.')[0].toUpperCase() + ' Organization'
      : `${autoName}'s Team`;

    const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || autoName)}&background=000000&color=ffffff&bold=true`;

    if (action === 'signup') {
      const existing = await env.DB.prepare('SELECT id, email, name, organization_name, role, plan FROM users WHERE email = ?').bind(cleanEmail).first();
      if (existing) {
        return new Response(JSON.stringify({ 
          success: true,
          user: {
            id: existing.id,
            email: existing.email,
            name: existing.name || autoName,
            organizationName: existing.organization_name || autoOrg,
            role: existing.role || 'member',
            plan: existing.plan || 'starter',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(existing.name || autoName)}&background=000000&color=ffffff&bold=true`
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
        'owner',
        'starter',
        new Date().toISOString()
      ).run();

      return new Response(JSON.stringify({
        success: true,
        user: { 
          id, 
          email: cleanEmail, 
          name: finalName, 
          organizationName: finalOrg, 
          plan: 'starter', 
          role: 'owner',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=000000&color=ffffff&bold=true`
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'login') {
      let user = await env.DB.prepare('SELECT id, email, name, organization_name, role, plan FROM users WHERE email = ?').bind(cleanEmail).first();
      
      if (!user) {
        // Create account on first login for user's own identity
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
          'owner',
          'starter',
          new Date().toISOString()
        ).run();

        user = { 
          id, 
          email: cleanEmail, 
          name: finalName, 
          organization_name: finalOrg, 
          role: 'owner', 
          plan: 'starter' 
        };
      }

      const finalName = (user.name && user.name !== 'Tejas Gogavale' && user.name !== 'Admin') ? user.name : (name?.trim() || autoName);
      const finalOrg = (user.organization_name && user.organization_name !== 'DevStudio Global Academy') ? user.organization_name : (organizationName?.trim() || autoOrg);

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: finalName,
          organizationName: finalOrg,
          role: user.role || 'owner',
          plan: user.plan || 'starter',
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
