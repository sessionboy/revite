import React,{ ComponentType } from 'react';

export type loaderFn = (props?:any) => Promise<ComponentType>;

// 动态加载高阶组件
export const dynamic = (loader: loaderFn, Loading?:ComponentType):ComponentType => {
  let Component:any = null;

  class DynamicComponent extends React.Component {
    state:any;
    // 确保渲染前加载该组件，在服务端渲染时调用该方法: loader.ts
    static async load() {
      const res:any = await loader();
      Component = res.default || res;
      return Component;
    }

    constructor(props:any) {
      super(props);
      this.state = {
        isLoading: false,
        Component,
      };
    }

    componentDidMount() {
      if(!Component){
        DynamicComponent.load().then(this.updateState);
      }     
    }

    componentWillUnmount() {
      const { resetInitialData }:any = this.props;
      if (resetInitialData) {
        resetInitialData();
      }
    }

    updateState = () => {
      const { Component: ComponentState }:any = this.state;
      // Only update state if we don't already have a reference to the
      // component, this prevent unnecessary renders.
      if (ComponentState !== Component) {
        this.setState({
          Component,
        });
      }
    };

    render() {
      const { isLoading }:any = this.state;
      const ComponentState = this.state.Component||Component;
     
      if (!ComponentState||isLoading) {
        return Loading?<Loading />:<div>loading...</div>;
      }

      return (
        <ComponentState
          {...this.props}
          loading={isLoading}
        />
      );
    }
  }
  return DynamicComponent;
}
