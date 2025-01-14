import React,{ ComponentType } from 'react';

export type loaderFn = (props?:any) => Promise<ComponentType>;

// 动态加载高阶组件
export const dynamic = (loader: loaderFn, Loading?:ComponentType):ComponentType => {
  let Component:any = null;

  class SSR extends React.Component {
    state:any;
    // 确保渲染前加载该组件，在服务端渲染时调用该方法: loader.ts
    static async load() {
      const res:any = await loader();
      Component = res.default || res;
      const getInitialProps = Component.getInitialProps||res.getInitialProps;
      if(getInitialProps){
        Component.refetch = getInitialProps;
        Component.getInitialProps = getInitialProps;
      }
      return Component;
    }

    // 在服务端渲染时调用该方法: loader.ts
    static async getInitialProps(ctx:any) {
      // Need to call the wrapped components getInitialProps if it exists
      if (!Component) {
        return Promise.resolve(null);
      }
      return Component.getInitialProps
        ? Component.getInitialProps(ctx)
        : Promise.resolve(null);
    }

    constructor(props:any) {
      super(props);
      this.state = {
        data: props.initialData,
        isLoading: false,
        Component,
      };
    }

    componentDidMount() {
      if(!Component){
        SSR.load().then(this.updateState);
      }     
      const { data } = this.state;
      if(Component && Component.getInitialProps && !data){
        this.fetchData();
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
      
      const { data }:any = this.state;

      if (!data) {
        this.fetchData();
      }
    };

    fetchData = () => {
      // if this.state.data is null, that means that the we are on the client.
      // To get the data we need, we just call getInitialProps again on mount.
      const { match, history, location }:any = this.props;
      this.setState({ isLoading: true });
      SSR.getInitialProps({ match, history, location }).then(
        (data) => {
          this.setState({ data, isLoading: false });
        },
        (error) => {
          this.setState(() => ({
            data: { error },
            isLoading: false,
          }));
        }
      );
    };

    render() {
      // Flatten out all the props.
      const { initialData, ...rest }:any = this.props;
      const { data, isLoading }:any = this.state;
      const ComponentState = this.state.Component||Component;
      //  if we wanted to create an app-wide error component,
      //  we could also do that here using <HTTPStatus />. However, it is
      //  more flexible to leave this up to the Routes themselves.
      //
      // if (rest.error && rest.error.code) {
      //   <HttpStatus statusCode={rest.error.code || 500}>
      //     {/* cool error screen based on status code */}
      //   </HttpStatus>
      // }
      if (!ComponentState||isLoading) {
        return Loading?<Loading />:<div>loading...</div>;
      }

      return (
        <ComponentState
          {...rest}
          {...data}
          refetch={this.fetchData}
          loading={isLoading}
        />
      );
    }
  }
  return SSR;
}
