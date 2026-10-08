interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body: any = await request.json();

    const items = Array.isArray(body) ? body : [body];
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'No certificates provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = new Date().toISOString();
    const defaultDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const statements = items.map(cert => {
      return env.DB.prepare(
        'INSERT OR REPLACE INTO certificates (certificate_id, project_id, recipient_name, recipient_email, course_name, organization_name, issue_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        cert.certificateId,
        cert.projectId || 'default',
        cert.recipientName || 'Recipient',
        cert.recipientEmail || '',
        cert.courseName || 'Certification Program',
        cert.organizationName || 'CertiForge Institution',
        cert.issueDate || defaultDate,
        'VERIFIED',
        now
      );
    });

    await env.DB.batch(statements);

    return new Response(JSON.stringify({ success: true, count: items.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
