import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../../helpers/make-public';
import { lookup } from 'mime-types'; // mime-types paketini yükleyin

@Controller('file')
export class FilesController {
  @Public()
  @Get(':folder/:imageName')
  getImage(
    @Param('folder') folder: string,
    @Param('imageName') imageName: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Dosya yolunu belirleyin
    const imageFullPath = path.join(
      process.cwd(),
      'uploadedFiles',
      folder,
      imageName,
    );
    console.log(imageFullPath);
    // Dosyanın varlığını kontrol edin
    if (!fs.existsSync(imageFullPath)) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    // MIME türünü belirleyin
    const mimeType = lookup(imageFullPath) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline');

    // Dosyayı stream olarak döndürün
    const file = fs.createReadStream(imageFullPath);
    file.on('data', (chunk) => console.log(chunk)); // <--- the data log gets printed
    file.on('end', () => console.log('done'));
    file.on('error', (err) => {
      console.error(err);
    });

    return new StreamableFile(file);
  }
}
