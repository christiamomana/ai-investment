export const GLOSSARY: Record<string, string> = {
  "Rev CAGR": "Compound Annual Growth Rate de ingresos — tasa de crecimiento anual compuesta de los ingresos. Ej: Rev CAGR del 15% significa que los ingresos crecen un 15% cada año de forma sostenida.",
  "CAGR": "Compound Annual Growth Rate — tasa de crecimiento anual compuesta. Mide el retorno constante anual de una inversión o métrica a lo largo de un período.",
  "FCF Margin": "Margen de Free Cash Flow = FCF / Ingresos × 100. Indica qué porcentaje de los ingresos se convierte en flujo de caja libre real. >20% es excelente en software.",
  "FCF": "Free Cash Flow — flujo de caja libre. FCF = Flujo de caja operativo − CapEx. Mide el efectivo real generado por el negocio, más difícil de manipular que el beneficio contable.",
  "ROIC": "Return on Invested Capital = NOPAT / Capital Invertido. Mide la eficiencia con que la empresa genera retorno sobre el capital empleado. >15% sostenido señala un moat competitivo real. ROIC > WACC = creación de valor.",
  "WACC": "Weighted Average Cost of Capital — costo promedio ponderado del capital. Es la tasa de retorno mínima que debe generar una empresa para crear valor. Si ROIC > WACC, la empresa crea valor.",
  "NOPAT": "Net Operating Profit After Tax — beneficio operativo neto después de impuestos. Se usa para calcular el ROIC: NOPAT = Beneficio operativo × (1 − Tasa impositiva).",
  "CapEx": "Capital Expenditures — inversiones en bienes de capital (maquinaria, infraestructura, tecnología). Se resta del flujo operativo para calcular el FCF.",
  "P/FCF": "Price-to-Free Cash Flow — precio sobre flujo de caja libre. Más fiable que el P/E porque el FCF es más difícil de manipular contablemente.",
  "P/E": "Price-to-Earnings — precio sobre beneficios. Indica cuántas veces se paga el beneficio anual por acción. El S&P 500 históricamente cotiza a ~20-25x.",
  "EV/EBITDA": "Enterprise Value / EBITDA. EV = Market Cap + Deuda − Caja. Útil para comparar empresas con distintas estructuras de capital o situaciones fiscales. Elimina el efecto del apalancamiento.",
  "EV/Revenue": "Enterprise Value / Ingresos — valoración expresada como múltiplo de los ingresos totales. Común en empresas SaaS de alto crecimiento.",
  "P/S": "Price-to-Sales — precio sobre ventas. Útil para valorar empresas en fase de crecimiento sin beneficios todavía. Se compara con peers del mismo sector.",
  "PEG": "PEG Ratio = P/E / Tasa de crecimiento anual de EPS. PEG < 1.0 puede indicar infravaloración respecto al crecimiento esperado. PEG > 2.0 puede señalar sobrevaloración.",
  "EPS": "Earnings Per Share — beneficio neto por acción. EPS = Beneficio neto / Nº de acciones. Métrica clave de rentabilidad para los accionistas.",
  "EBITDA": "Earnings Before Interest, Taxes, Depreciation and Amortization — beneficio antes de intereses, impuestos, depreciaciones y amortizaciones. Proxy del flujo de caja operativo.",
  "Debt/Equity": "Ratio Deuda/Patrimonio — mide el apalancamiento financiero de la empresa. <1.5x es saludable en la mayoría de sectores. Las empresas con alto Debt/Equity son más vulnerables en recesiones.",
  "Interest Coverage": "EBIT / Gastos financieros — indica cuántas veces la empresa puede cubrir sus intereses con sus beneficios operativos. >5x es saludable; <2x es una señal de alerta.",
  "DCF": "Discounted Cash Flow — método de valoración que estima el valor intrínseco descontando los flujos de caja futuros al presente a una tasa que refleja el riesgo.",
  "Reverse DCF": "Variante del DCF: parte del precio actual y calcula qué tasa de crecimiento implícita está descontando el mercado. Si esa tasa parece poco realista, la acción puede estar sobrevalorada.",
  "Margen de seguridad": "Concepto de Benjamin Graham: solo comprar cuando el precio está significativamente por debajo del valor intrínseco (20-30%+), para protegerse de errores de estimación y eventos inesperados.",
  "Moat": "Ventaja competitiva duradera que protege a una empresa de sus competidores: marca, network effects, switching costs, patentes, economías de escala o licencias regulatorias.",
  "Gross Margin": "Margen bruto = (Ingresos − Coste de ventas) / Ingresos × 100. Indica la rentabilidad intrínseca del producto o servicio antes de gastos operativos. >70% es típico en SaaS.",
  "Net Margin": "Margen neto = Beneficio neto / Ingresos × 100. Porcentaje de ingresos que se convierte en beneficio final después de todos los gastos e impuestos.",
  "Bull case": "Escenario optimista — los catalizadores positivos se materializan y la empresa supera las expectativas del mercado.",
  "Bear case": "Escenario pesimista — los riesgos se materializan y la empresa no cumple con las expectativas del mercado.",
};

/**
 * Returns terms sorted longest-first to avoid partial matches
 * (e.g. "FCF Margin" before "FCF")
 */
export function getGlossaryTerms(): string[] {
  return Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
}
