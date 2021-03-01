import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const headtags: string[] = ["meta","base","link","style","script"];

let originTitle = null;
export default ({ children }: any)=>{
  if(!originTitle && typeof window !== "undefined"){
    originTitle = document.title;
  }
  let title = null;
  let tags: any[] = children;
  if(Object.prototype.toString.call(children) === "[object Object]"){
    tags = [children];
  }
  tags = tags.filter(i=>{
    if(i.type === "title"){
      const { children } = i.props;
      title =
        typeof children === 'string'
          ? children
          : Array.isArray(children)
          ? children.join('')
          : ''
      if (title !== document.title) document.title = title
    }
    return headtags.includes(i.type);
  });

  // 为ssr渲染提供headtags
  if(
    typeof window === "undefined" &&
    (global as any)._ssr_head_ && 
    Array.isArray((global as any)._ssr_head_)
  ){
    (global as any)._ssr_head_.concat(tags);
    return null;
  }

  useEffect(()=>{
    return ()=>{
      // 卸载前还原为最初的title
      if(
        typeof window !== "undefined" && 
        title && 
        title !== originTitle &&
        originTitle
      ){
        document.title = originTitle;
      }
    }
  })

  return createPortal(
    tags,
    document.head
  );
}