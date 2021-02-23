import { InternalConfig } from '@revite/types'
import esmPlugin from "./esmPlugin.js";
import renderPlugin from "./renderPlugin.js";
import assetsPlugin from "./assetsPlugin.js";

export default (config:InternalConfig)=>{
  return [
    renderPlugin,
    esmPlugin,
    assetsPlugin
  ];
}
