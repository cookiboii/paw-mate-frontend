import { mkdir, readdir } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const sourceDirectory = 'src/assets';
const outputDirectory = join(sourceDirectory, 'optimized');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png']);

await mkdir(outputDirectory, { recursive: true });

const files = await readdir(sourceDirectory);
const images = files.filter((file) => supportedExtensions.has(parse(file).ext.toLowerCase()));

await Promise.all(images.flatMap(async (file) => {
  const input = join(sourceDirectory, file);
  const name = parse(file).name;
  const resize = { width: 960, withoutEnlargement: true };

  await Promise.all([
    sharp(input).resize(resize).webp({ quality: 78, effort: 5 }).toFile(join(outputDirectory, `${name}.webp`)),
    sharp(input).resize(resize).avif({ quality: 52, effort: 6 }).toFile(join(outputDirectory, `${name}.avif`)),
  ]);
}));

console.log(`Optimized ${images.length} image(s) in ${outputDirectory}`);
