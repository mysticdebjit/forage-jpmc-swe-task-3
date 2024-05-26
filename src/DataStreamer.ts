export interface ServerRespond {
  stock: string,
  top_bid: {
    price: number,
    size: number,
  },
  top_ask: {
    price: number,
    size: number,
  },
  timestamp: Date,
}

class DataStreamer {
  static async getData(): Promise<ServerRespond[]> {
    const response = await fetch('http://localhost:8080/query');
    return await response.json();
  }
}

export default DataStreamer;
