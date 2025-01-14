export default interface Events {
    _id?: any,
    type: string | undefined,
    infos: {
        city: string | undefined,
        district: string | undefined,
        adress: string | undefined,
        reference: string | undefined,
        name: string | undefined,
        description: string | undefined,
    },
    recurrence: {
        startDate: string; // Data inicial no formato ISO (e.g., "2025-01-15T00:00:00Z")
        endDate?: string; // (Opcional) Data final no formato ISO
        startTime: string; // horario de inicio (ex: 19:30)
        endTime: string; // horario de termino (ex: 21:00)
        type: "daily" | "weekly" | "monthly" | "yearly"; // Tipo de recorrência
        interval?: number; // Intervalo entre ocorrências (e.g., 1 = todo dia/semana/mês/ano)
        daysOfWeek?: number[]; // Dias da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
        weekOfMonth?: number; // (Opcional) Semana do mês (1 = Primeira, 2 = Segunda, ..., 5 = Última)
      }
}