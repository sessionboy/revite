
#### 命名规范
使用下划线以避免出现重名的问题。

例如，由于这里导入了"@revite/core"，因此这里的index.d.ts会和"@revite/core" 中的index.d.ts发生冲突，导致"@revite/core"无法更新。问题如下：
```js
Cannot write file "xxx"  because it would overwrite input file
```