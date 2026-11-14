import 'dotenv/config';
import express from 'express';
import http from 'http';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'cozypixelboy@gmail.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASS);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

interface AlertHistoryItem {
  id: string;
  eventType: string;
  subject: string;
  summary: string;
  recipient: string;
  dispatched: boolean;
  reason?: string;
  timestamp: string;
}

const recentServerAlerts: AlertHistoryItem[] = [];

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '256kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'COZY_ESPORTS',
      smtpConfigured: isSmtpConfigured,
      adminEmail: ADMIN_ALERT_EMAIL,
    });
  });

  app.get('/api/email-status', (_req, res) => {
    res.json({
      smtpConfigured: isSmtpConfigured,
      adminEmail: ADMIN_ALERT_EMAIL,
      recentAlerts: recentServerAlerts.slice(0, 25),
    });
  });

  app.post('/api/notify-admin', async (req, res) => {
    const body = req.body || {};
    const eventType = String(body.eventType || 'system').slice(0, 40);
    const subject = String(body.subject || 'COZY_ESPORTS Alert').slice(0, 160);
    const summary = String(body.summary || '').slice(0, 1000);
    const details = (typeof body.details === 'object' && body.details !== null ? body.details : {}) as Record<string, unknown>;

    if (!summary) {
      res.status(400).json({ ok: false, error: 'Missing alert summary' });
      return;
    }

    const detailRows = Object.entries(details)
      .slice(0, 12)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:12px;">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #1e293b;color:#f8fafc;font-weight:bold;font-size:12px;">${escapeHtml(String(v ?? ''))}</td></tr>`
      )
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;background:#090d16;color:#f1f5f9;padding:24px;border-radius:12px;max-width:560px;margin:0 auto;border:1px solid #ef4444;">
        <h2 style="margin:0 0 8px;color:#ffffff;">COZY<span style="color:#ef4444;">_ESPORTS</span> Alert</h2>
        <p style="margin:0 0 14px;color:#60a5fa;font-size:12px;font-weight:bold;text-transform:uppercase;">${escapeHtml(eventType)}</p>
        <p style="margin:0 0 16px;color:#e2e8f0;font-size:14px;line-height:1.5;">${escapeHtml(summary)}</p>
        ${detailRows ? `<table style="width:100%;border-collapse:collapse;background:#0f172a;border-radius:8px;">${detailRows}</table>` : ''}
        <p style="margin:18px 0 0;color:#64748b;font-size:11px;">Automated alert for ${escapeHtml(ADMIN_ALERT_EMAIL)}</p>
      </div>
    `;

    let dispatched = false;
    let reason: string | undefined;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"COZY_ESPORTS" <${SMTP_USER}>`,
          to: ADMIN_ALERT_EMAIL,
          subject: `[COZY_ESPORTS] ${subject}`,
          text: `${subject}\n\n${summary}\n\n${Object.entries(details)
            .map(([k, v]) => `${k}: ${String(v ?? '')}`)
            .join('\n')}`,
          html,
        });
        dispatched = true;
      } catch (err) {
        reason = err instanceof Error ? err.message : 'SMTP delivery failed';
        console.error('SMTP email error:', err);
      }
    } else {
      reason = 'SMTP_USER / SMTP_PASS not set in environment secrets';
    }

    const entry: AlertHistoryItem = {
      id: `srv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType,
      subject,
      summary,
      recipient: ADMIN_ALERT_EMAIL,
      dispatched,
      reason,
      timestamp: new Date().toISOString(),
    };
    recentServerAlerts.unshift(entry);
    if (recentServerAlerts.length > 50) recentServerAlerts.length = 50;

    res.json({
      ok: true,
      dispatched,
      recipient: ADMIN_ALERT_EMAIL,
      reason,
      entry,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`COZY_ESPORTS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
