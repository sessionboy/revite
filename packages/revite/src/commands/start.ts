import { Revite } from "@revite/core"
import { getReviteConfig } from "@revite/config"
import { InternalConfig } from "@revite/types"

export default async ()=>{
  const config: InternalConfig = await getReviteConfig({});
  const revite = new Revite(config);
  return revite;
}