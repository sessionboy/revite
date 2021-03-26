
### 基本思路

#### 一，首先，启动时先根据入口文件(index.html)编译
1，查找依赖包并且编译

2，编译业务代码

#### 二，请求或更新时按需加载资源

1，根据请求url去按需加载和编译代码
```js
const content = loadUrl(url);
```
2，根据文件类型不同，执行不同的编译任务
```js
if(js){
  code = transformEsm(url,config);
}
else if(css){
  code = transformCss(url,config);
}
else if(html){
  code = transformHtml(url,config);
}
else if(file){
  code = transformFile(url,config);
}

```