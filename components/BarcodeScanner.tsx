"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  X,
  Search,
  CheckCircle,
  Scan,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ZXing imports
import { BrowserMultiFormatReader } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  title?: string;
  enableTestBarcodes?: boolean;
}

export function BarcodeScanner({
  onScan,
  onClose,
  title = "Barkod Okuyucu",
  enableTestBarcodes = true,
}: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Desteklenen barkod formatları (gelecekte kullanım için)
  // const supportedFormats = [
  //   BarcodeFormat.QR_CODE,
  //   BarcodeFormat.CODE_128,
  //   BarcodeFormat.CODE_39,
  //   BarcodeFormat.EAN_13,
  //   BarcodeFormat.EAN_8,
  //   BarcodeFormat.UPC_A,
  //   BarcodeFormat.UPC_E,
  //   BarcodeFormat.CODABAR,
  // ];

  // Kamera cihazlarını listele
  useEffect(() => {
    async function getDevices() {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);

        // Arka kamerayı tercih et
        const backCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );

        if (backCamera) {
          setSelectedDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Kamera cihazları alınamadı:", error);
        setCameraError("Kamera cihazları alınamadı");
      }
    }

    getDevices();
  }, []);

  // Kamera taramayı başlat
  const startScanning = useCallback(async () => {
    if (!videoRef.current || isScanning) return;

    setIsLoading(true);
    setCameraError(null);

    try {
      // ZXing kodu okuyucuyu başlat
      // const hints = new Map();
      codeReaderRef.current = new BrowserMultiFormatReader();

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // Video stream'i başlat
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Barkod okumayı başlat
      if (codeReaderRef.current) {
        codeReaderRef.current.decodeFromVideoDevice(
          selectedDeviceId || null,
          videoRef.current,
          (result: unknown, error: unknown) => {
            if (result) {
              const barcode = (result as { getText(): string }).getText();
              if (barcode && barcode.trim()) {
                setScannedBarcode(barcode);
                toast.success(`Barkod tespit edildi: ${barcode}`);
                onScan(barcode);
                stopScanning();
              }
            }

            if (
              error &&
              !((error as { name?: string }).name === "NotFoundException")
            ) {
              console.error("Tarama hatası:", error);
            }
          }
        );
      }

      setIsScanning(true);
      toast.success("Barkod tarama başlatıldı");
    } catch (error) {
      console.error("Kamera başlatma hatası:", error);
      let errorMessage = "Kamera erişimi sağlanamadı";

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin.";
        } else if (error.name === "NotFoundError") {
          errorMessage =
            "Kamera bulunamadı. Lütfen kamera bağlantısını kontrol edin.";
        } else if (error.name === "NotReadableError") {
          errorMessage =
            "Kamera kullanımda. Lütfen diğer uygulamaları kapatın.";
        }
      }

      setCameraError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId, isScanning, onScan]);

  // Kamera taramayı durdur
  const stopScanning = useCallback(() => {
    setIsScanning(false);

    // Video stream'i durdur
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Video element'i temizle
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Code reader'ı durdur
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
  }, []);

  // Component unmount olduğunda temizlik
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // Manuel barkod girişi
  const handleManualSubmit = () => {
    const trimmedBarcode = manualBarcode.trim();
    if (trimmedBarcode) {
      onScan(trimmedBarcode);
      toast.success(`Barkod eklendi: ${trimmedBarcode}`);
      setManualBarcode("");
      setScannedBarcode(trimmedBarcode);
    } else {
      toast.error("Lütfen geçerli bir barkod girin");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleManualSubmit();
    }
  };

  // Test barkodları
  const testBarcodes = [
    { code: "1234567890123", type: "EAN-13" },
    { code: "9876543210987", type: "EAN-13" },
    { code: "CODE128TEST", type: "Code 128" },
    { code: "123456789012", type: "UPC-A" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mod Seçimi */}
        <div className="flex gap-2">
          <Button
            variant={!isManualMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsManualMode(false);
              setCameraError(null);
            }}
            disabled={isLoading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Kamera Tarama
          </Button>
          <Button
            variant={isManualMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsManualMode(true);
              stopScanning();
            }}
            disabled={isLoading}
          >
            <Search className="h-4 w-4 mr-2" />
            Manuel Giriş
          </Button>
        </div>

        {/* Kamera Modu */}
        {!isManualMode && (
          <div className="space-y-4">
            {/* Kamera Seçimi */}
            {devices.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kamera Seçin:</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                  disabled={isScanning}
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Kamera ${device.deviceId.slice(0, 8)}...`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Video Preview */}
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />

              {/* Overlay - Tarama Çerçevesi */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center bg-black bg-opacity-50 p-2 rounded">
                        <Scan className="h-6 w-6 mx-auto mb-1 animate-pulse" />
                        <p className="text-xs">
                          Barkodu çerçeve içine hizalayın
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-white text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Kamera başlatılıyor...</p>
                  </div>
                </div>
              )}

              {/* Error Overlay */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                  <div className="text-center p-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-red-700">{cameraError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tarama Kontrolleri */}
            <div className="flex gap-2">
              <Button
                onClick={isScanning ? stopScanning : startScanning}
                className="flex-1"
                variant={isScanning ? "destructive" : "default"}
                disabled={isLoading || !!cameraError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Başlatılıyor...
                  </>
                ) : isScanning ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Taramayı Durdur
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Taramayı Başlat
                  </>
                )}
              </Button>

              {cameraError && (
                <Button
                  onClick={() => {
                    setCameraError(null);
                    startScanning();
                  }}
                  variant="outline"
                >
                  Tekrar Dene
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Manuel Mod */}
        {isManualMode && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Barkod Numarası:</label>
                <Input
                  placeholder="Barkod numarasını buraya girin..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-mono"
                  autoFocus
                />
              </div>

              <Button onClick={handleManualSubmit} className="w-full" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Barkod Ekle
              </Button>
            </div>

            {/* Test Barkodları */}
            {enableTestBarcodes && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Test Barkodları:</span>
                  <Badge variant="secondary" className="text-xs">
                    Geliştirme
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {testBarcodes.map((item) => (
                    <Button
                      key={item.code}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setManualBarcode(item.code);
                        onScan(item.code);
                        setScannedBarcode(item.code);
                        toast.success(`Test barkodu eklendi: ${item.code}`);
                      }}
                      className="text-xs font-mono"
                    >
                      <div className="text-center">
                        <div>{item.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.type}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Son Taranan Barkod */}
        {scannedBarcode && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950/20 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Son Taranan Barkod:
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScannedBarcode("")}
                className="text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="font-mono text-lg text-green-700 dark:text-green-300 mt-2 break-all">
              {scannedBarcode}
            </p>
          </div>
        )}

        {/* Desteklenen Formatlar */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="font-medium mb-2">Desteklenen Barkod Formatları:</p>
          <div className="flex flex-wrap gap-1">
            {[
              "QR Code",
              "Code 128",
              "Code 39",
              "EAN-13",
              "EAN-8",
              "UPC-A",
              "UPC-E",
              "Codabar",
            ].map((format) => (
              <Badge key={format} variant="secondary" className="text-xs">
                {format}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
