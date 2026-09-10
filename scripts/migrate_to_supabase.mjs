import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase with service role key (run locally only)
const SUPABASE_URL = 'https://ctavbergopvzeqnxrbbo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is not set');
  console.error('Usage: SUPABASE_SERVICE_KEY=your_key node migrate_to_supabase.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseMarkdownFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = YAML.parse(match[1]);
  const body = match[2];

  return { ...frontmatter, body };
}

async function migrateProfile() {
  console.log('Migrating profile...');
  const bioPath = path.join(__dirname, '../_data/bio.yml');
  if (!fs.existsSync(bioPath)) {
    console.warn('Warning: _data/bio.yml not found');
    return;
  }

  const bioYaml = YAML.parse(fs.readFileSync(bioPath, 'utf-8'));

  const { error } = await supabase
    .from('profile')
    .upsert([{
      id: 1,
      name: bioYaml.name,
      title: bioYaml.title,
      affiliation: bioYaml.affiliation,
      email: bioYaml.email,
      bio_short: bioYaml.bio_short,
      bio_full: bioYaml.bio_full,
      research_interests: bioYaml.research_interests || [],
      profile_image_url: bioYaml.profile_image,
      cv_url: bioYaml.download_cv
    }], { onConflict: 'id' });

  if (error) console.error('Error migrating profile:', error);
  else console.log('✓ Profile migrated');
}

async function migrateContact() {
  console.log('Migrating contact...');
  const contactPath = path.join(__dirname, '../_data/contact.yml');
  if (!fs.existsSync(contactPath)) {
    console.warn('Warning: _data/contact.yml not found');
    return;
  }

  const contactYaml = YAML.parse(fs.readFileSync(contactPath, 'utf-8'));

  const { error } = await supabase
    .from('contact')
    .upsert([{
      id: 1,
      email: contactYaml.email,
      office: contactYaml.office,
      office_hours: contactYaml.office_hours,
      social: contactYaml.social || {}
    }], { onConflict: 'id' });

  if (error) console.error('Error migrating contact:', error);
  else console.log('✓ Contact migrated');
}

async function migrateCollectionItems(collectionName, tableName) {
  console.log(`Migrating ${collectionName}...`);
  const collectionPath = path.join(__dirname, `../_${collectionName}`);

  if (!fs.existsSync(collectionPath)) {
    console.warn(`Warning: _${collectionName} directory not found`);
    return;
  }

  const files = fs.readdirSync(collectionPath).filter(f => f.endsWith('.md'));
  const items = [];

  for (const file of files) {
    const parsed = parseMarkdownFrontmatter(path.join(collectionPath, file));
    if (!parsed) continue;

    const slug = parsed.slug || slugify(parsed.title || file.replace('.md', ''));

    const item = {
      title: parsed.title,
      slug,
      tags: parsed.tags || [],
      date: parsed.date ? new Date(parsed.date).toISOString().split('T')[0] : null,
      created_at: new Date().toISOString()
    };

    // Collection-specific fields
    if (tableName === 'publications') {
      item.authors = parsed.authors || [];
      item.venue = parsed.venue;
      item.abstract = parsed.abstract;
      item.pdf_url = parsed.pdf;
      item.doi = parsed.doi;
      item.code_url = parsed.code;
      item.arxiv_url = parsed.arxiv;
    } else if (tableName === 'talks') {
      item.event = parsed.event;
      item.location = parsed.location;
      item.description = parsed.content || parsed.body;
      item.slides_url = parsed.slides;
      item.video_url = parsed.video;
    } else if (tableName === 'resources') {
      item.resource_type = parsed.resource_type;
      item.link = parsed.link;
      item.description = parsed.description || parsed.excerpt;
    } else if (tableName === 'posts') {
      item.author = parsed.author;
      item.content = parsed.body;
      item.excerpt = parsed.excerpt;
    }

    items.push(item);
  }

  if (items.length === 0) {
    console.log(`  No items found for ${collectionName}`);
    return;
  }

  const { error } = await supabase
    .from(tableName)
    .upsert(items, { onConflict: 'slug' });

  if (error) console.error(`Error migrating ${collectionName}:`, error);
  else console.log(`✓ ${collectionName} migrated (${items.length} items)`);
}

async function main() {
  try {
    console.log('Starting migration to Supabase...\n');

    await migrateProfile();
    await migrateContact();
    await migrateCollectionItems('pubs', 'publications');
    await migrateCollectionItems('talks', 'talks');
    await migrateCollectionItems('resources', 'resources');
    await migrateCollectionItems('posts', 'posts');

    console.log('\n✓ Migration complete!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
