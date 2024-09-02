import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";

interface PageProps {
  searchParams: {
    [key: string] : string | string[] | undefined
  }
}

const Page = async ({searchParams}: PageProps) => {
  const {id} = searchParams;

  if(!id || typeof id !== "string") {
    return notFound()
  }

  const config = await db.configuration.findUnique({
    where: { id }
  })

  if(!config) {
    return notFound();
  }

const {imageURL, width, height} = config;

  return <DesignConfigurator
    configId={config.id}
    imageDimensions={{ width, height }}
    imageURL={imageURL}
  />
}

export default Page;
