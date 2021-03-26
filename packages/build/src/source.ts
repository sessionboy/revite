import { Revite } from "@revite/core"
import { InternalConfig } from "@revite/types"

export class SourceService {
  private revite: Revite;
  private config: InternalConfig;

  constructor(revite:any){
    this.revite = revite;
    this.config = revite.config;

  }

  async ready(){

  }

  async get(){
    
  }

  async set(){

  }

  async resolve(){

  }

  async remove(){

  }

  async clear(){

  }
}