/**
 * Kredi hesaplama yardımcı fonksiyonları
 */
export class LoanCalculator {
    /**
     * Aylık ödeme tutarını hesaplar
     * @param totalAmount - Toplam kredi tutarı
     * @param installmentCount - Taksit sayısı
     * @param interestRate - Yıllık faiz oranı (opsiyonel, % cinsinden)
     * @returns Aylık ödeme tutarı
     */
    static calculateMonthlyPayment(
        totalAmount: number,
        installmentCount: number,
        interestRate?: number
    ): number {
        if (installmentCount <= 0) {
            throw new Error('Taksit sayısı 0\'dan büyük olmalıdır')
        }

        // Faiz yoksa basit bölme
        if (!interestRate || interestRate === 0) {
            return totalAmount / installmentCount
        }

        // Faizli kredi hesaplama (aylık faiz oranı)
        const monthlyRate = interestRate / 100 / 12

        // Aylık ödeme formülü: P * [r(1+r)^n] / [(1+r)^n - 1]
        // P = ana para, r = aylık faiz, n = taksit sayısı
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, installmentCount)
        const denominator = Math.pow(1 + monthlyRate, installmentCount) - 1

        return totalAmount * (numerator / denominator)
    }

    /**
     * Toplam faiz tutarını hesaplar
     * @param totalAmount - Toplam kredi tutarı
     * @param installmentCount - Taksit sayısı
     * @param interestRate - Yıllık faiz oranı (% cinsinden)
     * @returns Toplam ödenecek faiz tutarı
     */
    static calculateTotalInterest(
        totalAmount: number,
        installmentCount: number,
        interestRate: number
    ): number {
        if (!interestRate || interestRate === 0) {
            return 0
        }

        const monthlyPayment = this.calculateMonthlyPayment(
            totalAmount,
            installmentCount,
            interestRate
        )

        const totalPayment = monthlyPayment * installmentCount
        return totalPayment - totalAmount
    }

    /**
     * Kalan borç tutarını hesaplar
     * @param totalAmount - Toplam kredi tutarı
     * @param installmentCount - Toplam taksit sayısı
     * @param remainingInstallments - Kalan taksit sayısı
     * @param interestRate - Yıllık faiz oranı (opsiyonel)
     * @returns Kalan borç tutarı
     */
    static calculateRemainingDebt(
        totalAmount: number,
        installmentCount: number,
        remainingInstallments: number,
        interestRate?: number
    ): number {
        if (!interestRate || interestRate === 0) {
            // Faizsiz kredi: basit orantı
            return (totalAmount / installmentCount) * remainingInstallments
        }

        // Faizli kredi: kalan taksitlerin bugünkü değeri
        const monthlyPayment = this.calculateMonthlyPayment(
            totalAmount,
            installmentCount,
            interestRate
        )

        const monthlyRate = interestRate / 100 / 12

        // Kalan borç = Aylık ödeme * [(1 - (1+r)^-n) / r]
        const factor = (1 - Math.pow(1 + monthlyRate, -remainingInstallments)) / monthlyRate
        return monthlyPayment * factor
    }
}
