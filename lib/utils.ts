import "cheerio";
import {
  CheerioWebBaseLoader,
  CheerioWebBaseLoaderParams,
} from "@langchain/community/document_loaders/web/cheerio";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Function for fetching the contents of a webpage and returns Documents[]
 * @param url
 */
export async function fetch_webpage(url: string) {
  const webBaseParam: CheerioWebBaseLoaderParams = {
    selector: "p",
  };

  const webPageLoader = new CheerioWebBaseLoader(url, webBaseParam);

  const doc = await webPageLoader.load();

  return doc;
}
