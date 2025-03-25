import React, { Component } from 'react';
import '../styles/WaterInkTheme.css';

/**
 * 错误边界组件
 * 捕获子组件中的JavaScript错误，并显示友好的错误提示
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下一次渲染将显示错误UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('应用错误:', error);
    console.error('错误详情:', errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary water-ink-theme">
          <div className="error-content">
            <h1>游戏加载出错</h1>
            <p>请刷新页面或联系开发者。</p>
            <button 
              className="ink-button" 
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>错误详情</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </div>
        </div>
      );
    }
    
    // 如果没有错误，正常渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;
