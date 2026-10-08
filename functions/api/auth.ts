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

    if (action === 'signup') {
      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'User with this email already exists' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const id = `usr-${Date.now()}`;
      await env.DB.prepare(
        'INSERT INTO users (id, email, name, password_hash, organization_name, role, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        id,
        email,
        name || 'Admin',
        password || '',
        organizationName || 'Global Academy',
        'owner',
        'pro',
        new Date().toISOString()
      ).run();

      return new Response(JSON.stringify({
        success: true,
        user: { id, email, name, organizationName, plan: 'pro', role: 'owner' }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'login') {
      let user = await env.DB.prepare('SELECT id, email, name, organization_name, role, plan FROM users WHERE email = ?').bind(email).first();
      
      if (!user) {
        // Auto-provision demo session if testing
        const id = `usr-${Date.now()}`;
        await env.DB.prepare(
          'INSERT INTO users (id, email, name, password_hash, organization_name, role, plan, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          id,
          email,
          'Tejas Gogavale',
          password || '',
          'DevStudio Global Academy',
          'owner',
          'pro',
          new Date().toISOString()
        ).run();

        user = { id, email, name: 'Tejas Gogavale', organization_name: 'DevStudio Global Academy', role: 'owner', plan: 'pro' };
      }

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationName: user.organization_name,
          role: user.role,
          plan: user.plan
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
