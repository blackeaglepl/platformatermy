<?php

namespace App\Services;

use App\Models\Package;
use TCPDF;

class PackagePdfService
{
    protected TCPDF $pdf;
    protected string $fontPath;

    public function __construct()
    {
        $this->fontPath = storage_path('fonts');
        $this->initializePdf();
    }

    protected function initializePdf(): void
    {
        // Format DL poziomy: 210mm x 99mm
        $this->pdf = new TCPDF('L', 'mm', [99, 210], true, 'UTF-8', false);

        // Ustawienia dokumentu
        $this->pdf->SetCreator('TermyGorce Admin');
        $this->pdf->SetAuthor('TermyGorce');
        $this->pdf->SetTitle('Pakiet - Naturalna Harmonia');

        // Wyłącz nagłówek i stopkę
        $this->pdf->setPrintHeader(false);
        $this->pdf->setPrintFooter(false);

        // Marginesy - zero dla pełnego tła
        $this->pdf->SetMargins(0, 0, 0);
        $this->pdf->SetAutoPageBreak(false, 0);
    }

    public function generatePackagePdf(Package $package): string
    {
        // Strona 1 - Główna strona z danymi
        $this->createPage1($package);

        // Strona 2 - Lista usług (statyczna)
        $this->createPage2($package);

        // Zwróć PDF jako string (do pobrania)
        return $this->pdf->Output('', 'S');
    }

    protected function createPage1(Package $package): void
    {
        // Dodaj nową stronę
        $this->pdf->AddPage();

        // Dynamicznie wybierz szablon na podstawie package_type (1-6)
        $templateNumber = $package->package_type ?? 1;
        $backgroundPath = public_path("pdf-templates/pakiet-{$templateNumber}-page1.jpg");

        // Sprawdź czy plik istnieje, jeśli nie - użyj domyślnego
        if (!file_exists($backgroundPath)) {
            $backgroundPath = public_path('pdf-templates/pakiet-1-page1.jpg');
        }

        $this->pdf->Image($backgroundPath, 0, 0, 210, 99, 'JPG', '', '', false, 300, '', false, false, 0);

        // Kolor tekstu - ciemny (czarny/ciemnoszary) dla lepszej czytelności
        $this->pdf->SetTextColor(80, 80, 80);

        // === POLE 1: ID (małe pole na środku, nad polami data/posiadacz) ===
        // Format DL: 210mm x 99mm, pole ID około x=62mm, y=64mm
        $this->pdf->SetFont('dejavusans', '', 10);
        $this->pdf->SetXY(62, 64);
        $this->pdf->Cell(50, 5, $package->package_id ?? 'N/A', 0, 0, 'C', false);

        // === POLE 2: DATA ZAKUPU (pole na dole po lewej) ===
        // Pole "Data zakupu" około x=62mm, y=78mm
        $this->pdf->SetFont('dejavusans', '', 10);
        $this->pdf->SetXY(62, 78);
        $dateText = $package->created_at ? $package->created_at->format('d.m.Y') : date('d.m.Y');
        $this->pdf->Cell(50, 5, $dateText, 0, 0, 'C', false);

        // === POLE 3: POSIADACZ (pole na dole po prawej) ===
        // Pole "Posiadacz" około x=110mm, y=74mm, szerokość ~100mm
        // Używamy custom_id (to pole zawiera imię i nazwisko klienta)
        $this->pdf->SetFont('dejavusans', 'B', 13);
        $this->pdf->SetXY(110, 74);
        $this->pdf->Cell(100, 6, mb_strtoupper($package->custom_id ?? 'BRAK DANYCH', 'UTF-8'), 0, 0, 'C', false);
    }

    protected function createPage2(Package $package): void
    {
        // Dodaj stronę 2
        $this->pdf->AddPage();

        // Dynamicznie wybierz szablon strony 2 na podstawie package_type (1-6)
        $templateNumber = $package->package_type ?? 1;
        $backgroundPath = public_path("pdf-templates/pakiet-{$templateNumber}-page2.jpg");

        // Sprawdź czy plik istnieje, jeśli nie - użyj domyślnego
        if (!file_exists($backgroundPath)) {
            $backgroundPath = public_path('pdf-templates/pakiet-1-page2.jpg');
        }

        $this->pdf->Image($backgroundPath, 0, 0, 210, 99, 'JPG', '', '', false, 300, '', false, false, 0);

        // Strona 2 jest statyczna (bez dynamicznego tekstu) - tylko tło
    }

    public function downloadPdf(Package $package, string $filename = null): \Illuminate\Http\Response
    {
        $pdfContent = $this->generatePackagePdf($package);

        $filename = $filename ?? "Pakiet_{$package->package_id}.pdf";

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
