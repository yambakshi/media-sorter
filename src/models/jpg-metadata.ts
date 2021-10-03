export class DeviceData {
    manufacturer: string;
    model: string;
    os: string;
}

export class FileData {
    path: string;
    datetime: string;
    size: number;
    resolution: { width: number, height: number };
}

export class GPSData {
    latlng: number[];
    address: string;
}

export class JPGMetadata {
    device: DeviceData;
    file: FileData;
    gps: GPSData;
}