import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/db";

const f = createUploadthing();
 
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
  .input(z.object({ configId: z.string().optional()}))  
  .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      const res = await fetch(file.url);
      const buffer = await res.arrayBuffer();

      const imageMetadata = await sharp(buffer).metadata();
      const {width, height} = imageMetadata;

      try {
        if(!configId) {
          const configuration = await db.configuration.create({
          data: {
            imageURL: file.url,
            height: height || 500,
            width: width || 500,
          }
        })
         return { configId : configuration.id}
      } else {
        
        const updateConfiguration = await db.configuration.update({
          where: {
            id: configId
          },
          data: {
            croppedImageUrl: file.url
          }
        })
        
       return { configId : updateConfiguration.id}
      } 
    }
    catch (error) {
      throw new Error(`Prisma is fucking stupid!${error}`)
    }
    })
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;