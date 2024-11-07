import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../../helpers/make-public';
import * as mime from 'mime-types';

@Controller('file')
export class FilesController {
  @Public()
  @Get(':folder/:imageName')
  getImage(
    @Param('folder') folder: string,
    @Param('imageName') imageName: string,
    @Res() res: Response,
  ) {
    const imageFullPath = path.join(
      __dirname,
      '../../../uploadedFiles',
      folder,
      imageName,
    );

    console.log(imageFullPath);

    if (fs.existsSync(imageFullPath)) {
      // MIME türünü belirlemek için mime paketini kullan
      const mimeType = mime.lookup(imageFullPath) || 'application/octet-stream';

      // Content-Type başlığını MIME türü ile ayarla
      res.setHeader('Content-Type', mimeType);
      // Dosyanın tarayıcıda görüntülenmesi için Content-Disposition başlığını inline olarak ayarla
      res.setHeader('Content-Disposition', 'inline');

      return res.sendFile(imageFullPath);
    } else {
      return res.status(404).send('Dosya bulunamadı');
    }
  }
}
