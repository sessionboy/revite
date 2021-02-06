import React,{ ReactNode } from 'react';

export type Loader = (props?:any)=>Promise<ReactNode>;
export type ReactComponent = React.FC|React.ComponentClass;

interface StateProps{
  Component: ReactComponent|null
  error: any
  loading: boolean
  data: any
  getInitialProps: any
}

export default (loader: Loader, Loading?: ReactComponent):any => {
  let Component:any = null;
  
  class DynamicLoad extends React.Component {
    state: StateProps = {
      Component: Component,
      error: null,
      loading: true,
      data: null,
      getInitialProps: null
    }
    constructor(props:any) {
      super(props);
      this.loadModule();
    }

    async load(){
      console.log("dynamic loading....");
      await this.loadModule();
    }

    async loadModule(){
      if (!this.state.loading) return;
      try {
        const module:any = await loader();
        const component = module.__esModule 
          ? module.default 
          : module.default || module
        const getInitialProps = module.getInitialProps;
        // if (!ReactIs.isValidElementType(Component)) {
        //   throw new Error(
        //     `It is not a React component!`,
        //   )
        // }
        Component = component;
        this.setState({ 
          Component: component,
          getInitialProps,
          loading: false 
        });
        console.log("dynamic loading....", component);
      } catch (error) {
        console.error(
          'dynamic: failed to synchronously load component, which expected to be available',
          {
            error: error ? error.message : error,
          },
        )
        this.setState({ error });
      }
    }

    componentDidMount(){
      this.loadModule();
    }

    render() {
      if(this.state.loading){
        return Loading ? <Loading /> : "loading..."
      }

      if(!this.state.Component){
        return Loading ? <Loading /> : "loading page..."
      }

      const Component: ReactComponent = this.state.Component;
      const { initialData, ...rest }:any = this.props;
      return (
        <Component 
          {...rest}
          loading = { this.state.loading }
          data = { initialData }
        />
      )
    }
  }
  return DynamicLoad;
}
