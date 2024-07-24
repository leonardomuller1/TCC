function CardAuthComponent() {
  return (
    <div className="bg-gray-900 p-12 basis-1/2 flex flex-col justify-between">
      <img alt="logo" src="../../public/logo.png" className="w-32" />
      <div className="flex flex-col gap-4">
        <h3 className="text-gray-50 text-lg font-semibold">
          "Em alguns anos vão existir dois tipos de empresas: as que fazem
          negócios pela internet e as que estão fora dos negócios."
        </h3>
        <h4 className="text-gray-50 text-sm">Bill Gates</h4>
      </div>
    </div>
  );
}

export default CardAuthComponent;
