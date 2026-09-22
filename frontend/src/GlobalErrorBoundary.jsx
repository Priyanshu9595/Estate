import React from 'react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("GlobalErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#b71c1c', fontFamily: 'monospace' }}>
          <h2>Global Error Boundary Caught an Error:</h2>
          <p><b>{this.state.error.toString()}</b></p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: '10px' }}>{this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
