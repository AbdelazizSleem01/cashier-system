import React from 'react';
import Barcode from 'react-barcode';

const ProductBarcode = ({ barcode }) => {
  if (!barcode) return <div className="text-gray-500">لا يوجد باركود</div>;

  return (
    <div className="bg-white p-2 rounded border border-gray-200 flex justify-center items-center">
      <Barcode
        value={barcode}
        width={1}
        height={30}
        fontSize={12}
        margin={5}
        displayValue={true}
        background="#ffffff"
        lineColor="#000000"
      />
    </div>
  );
};

export default ProductBarcode;