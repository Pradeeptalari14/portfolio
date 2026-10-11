import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 6: Edge Routing, Offline PWA, and Quickstart Automation', () => {
  it('should precache all 3 destinations and studio SDK in public/sw.js', () => {
    const swPath = path.resolve(__dirname, '../public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent).toContain('/studios/');
    expect(swContent).toContain('/studios/learn/');
    expect(swContent).toContain('/src/js/studio-sdk.js');
    expect(swContent).toContain('tp-portfolio-cache-v11');
  });

  it('should configure /api/ reverse proxy pass and expanded CSP in nginx.conf', () => {
    const nginxPath = path.resolve(__dirname, '../nginx.conf');
    expect(fs.existsSync(nginxPath)).toBe(true);

    const nginxContent = fs.readFileSync(nginxPath, 'utf8');
    expect(nginxContent).toContain('location /api/');
    expect(nginxContent).toContain('proxy_pass http://127.0.0.1:8000;');
    expect(nginxContent).toContain('connect-src \'self\' http://localhost:8000');
  });

  it('should provide automated PostgreSQL seeder and developer quickstart scripts', () => {
    const seederPath = path.resolve(__dirname, '../backend/scripts/seed_studios.py');
    expect(fs.existsSync(seederPath)).toBe(true);

    const startShPath = path.resolve(__dirname, '../backend/start.sh');
    expect(fs.existsSync(startShPath)).toBe(true);

    const startPs1Path = path.resolve(__dirname, '../backend/start.ps1');
    expect(fs.existsSync(startPs1Path)).toBe(true);
  });
});
