
### 安装依赖
```
lerna bootstrap
```

### lerna 多文件夹
假如有文件夹 "packages" 和 "plugins"

1，首先在根目录package.json中添加以下代码
```
"workspaces": [
  "packages/*",
  "plugins/*"
],
```

2，然后在lerna.json中添加以下代码
```
"packages": [
  "packages/*",
  "plugins/*"
],
```

3，创建项目时指定文件夹

```
lerna create projectname dir
```

例如：
```
lerna create revite-plugin plugins
```
