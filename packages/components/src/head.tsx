import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const headtags: string[] = ["title","meta","base","link","style","script"];

const cacheTags = new Map();
let originTitle: string|null = null;
export default ({ children }: any)=>{
  const isServer = typeof window === "undefined";
  if(!originTitle && !isServer){
    originTitle = document.title;
  }
  let title: string|null = null;
  let tags: any[] = children;
  if(Object.prototype.toString.call(children) === "[object Object]"){
    tags = [children];
  }

  // 过滤非head元素
  tags = tags.filter(i=>{
    if(i.type === "title"){
      const { children } = i.props;
      title =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
          ? children.join('')
          : ''
      if (!isServer && title !== document.title){
        document.title = title;
      } 
    }
    return headtags.includes(i.type);
  });

  // 为ssr渲染提供headtags
  if(isServer && tags.length>0){
    tags.forEach(tag => {
      const { type, props } = tag;
      const key = JSON.stringify({type, props})
      if(!cacheTags.get(key)){
        (global as any)._ssr_head_.add(tag);
        cacheTags.set(key,tag)
      }                 
    });
    return null; 
  }

  useEffect(()=>{
    return ()=>{
      // 卸载前还原为最初的title
      if(!isServer && title && title !== originTitle && originTitle){
        document.title = originTitle;
      }
    }
  })

  return createPortal(tags, document.head);
}