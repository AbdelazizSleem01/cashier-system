import { useEffect, useState } from 'react';
import { Barcode, Usb } from 'lucide-react';

const BarcodeScanner = ({ onScan }) => {
  const [device, setDevice] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const requestDevice = async () => {
    try {
      setIsScanning(true);
      const filters = [
        { vendorId: 0x05e0 },  // Zebra
        { vendorId: 0x04b4 },  // Honeywell
        { vendorId: 0x0c2e },  // Socket Mobile
        { vendorId: 0x1eab },  // Datalogic
      ];
      const device = await navigator.usb.requestDevice({ filters });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      setDevice(device);
      readData(device);
    } catch (err) {
      setError('فشل في الاتصال: ' + err.message);
      setIsScanning(false);
    }
  };

  const readData = async (device) => {
    try {
      while (device.opened) {
        const result = await device.transferIn(1, 64);
        const barcode = new TextDecoder('utf-8').decode(result.data).replace(/\0/g, '').trim();
        if (barcode) onScan(barcode);
      }
    } catch (err) {
      setError('خطأ في القراءة: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const disconnect = async () => {
    if (device) {
      await device.close();
      setDevice(null);
    }
  };

  useEffect(() => {
    return () => device && disconnect();
  }, [device]);

  return (
    <div className="space-y-2">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        onClick={device ? disconnect : requestDevice}
        disabled={isScanning}
        className={`btn ${device ? 'btn-error' : 'btn-primary'} flex items-center gap-2`}
      >
        {device ? (
          <>
            <Usb className="h-4 w-4" />
            قطع الاتصال
          </>
        ) : (
          <>
            <Barcode className="h-4 w-4" />
            {isScanning ? 'جاري الاتصال...' : 'اتصال بالماسح'}
          </>
        )}
      </button>

      {device && (
        <div className="text-sm text-green-600 flex items-center gap-1">
          <Usb className="h-3 w-3" />
          الماسح متصل
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;