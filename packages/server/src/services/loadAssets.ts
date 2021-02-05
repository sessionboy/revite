
export default (assets:any)=>{
  const scripts:Array<string> = [];
  const styles:Array<string> = [];
  Object.keys(assets).map(item=>{
    if(item.endsWith(".css")){
      styles.push(item.replace("build/",''));
    }
    if(item.endsWith(".js")){
      scripts.push(item.replace("build/",''));
    }
  })
  return { scripts, styles }
}