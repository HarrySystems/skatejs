export const withLifecycle = (Base = HTMLElement) =>
  class extends Base {
    connectedCallback() {
      this.connecting && this.connecting();
      super.connectedCallback && super.connectedCallback();
      this.connected && this.connected();
    }
    disconnectedCallback() {
      this.disconnecting && this.disconnecting();
      super.disconnectedCallback && super.disconnectedCallback();
      this.disconnected && this.disconnected();
    }
  };
