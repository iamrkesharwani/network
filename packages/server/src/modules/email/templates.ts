import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '../../core/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const getHtmlTemplate = async (
  templateName: string,
  variables: Record<string, string>
): Promise<string> => {
  try {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.html`
    );
    let html = await fs.readFile(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), escapeHtml(value));
    }
    return html;
  } catch (error) {
    logger.error(error, `Failed to load email template: ${templateName}`);
    throw new Error('Template loading failed');
  }
};
