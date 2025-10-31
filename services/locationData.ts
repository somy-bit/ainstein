
export interface Country {
    name: string;
    code: string;
}
export interface State {
    name: string;
    code: string;
}

export const countries: Country[] = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Brazil', code: 'BR' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'France', code: 'FR' },
    { name: 'Singapore', code: 'SG' },
];

export const states: Record<string, State[]> = {
    US: [
        { name: 'California', code: 'CA' },
        { name: 'New York', code: 'NY' },
        { name: 'Texas', code: 'TX' },
        { name: 'Florida', code: 'FL' },
    ],
    CA: [
        { name: 'Ontario', code: 'ON' },
        { name: 'Quebec', code: 'QC' },
        { name: 'British Columbia', code: 'BC' },
    ],
    MX: [
        { name: 'Jalisco', code: 'JAL' },
        { name: 'Mexico City', code: 'CDMX' },
        { name: 'Nuevo León', code: 'NL' },
    ],
    BR: [
        { name: 'São Paulo', code: 'SP' },
        { name: 'Rio de Janeiro', code: 'RJ' },
        { name: 'Minas Gerais', code: 'MG' },
    ],
    GB: [
        { name: 'England', code: 'ENG' },
        { name: 'Scotland', code: 'SCT' },
        { name: 'Wales', code: 'WLS' },
    ],
    FR: [
        { name: 'Île-de-France', code: 'IDF' },
        { name: 'Provence-Alpes-Côte d\'Azur', code: 'PACA' },
        { name: 'Auvergne-Rhône-Alpes', code: 'ARA' },
    ],
    SG: [
        { name: 'Singapore', code: 'SG' },
    ],
};

export const cities: Record<string, string[]> = {
    CA: ['Los Angeles', 'San Francisco', 'San Diego'],
    NY: ['New York City', 'Buffalo', 'Rochester'],
    TX: ['Houston', 'Dallas', 'Austin'],
    FL: ['Miami', 'Orlando', 'Tampa'],
    ON: ['Toronto', 'Ottawa', 'Mississauga'],
    QC: ['Montreal', 'Quebec City', 'Laval'],
    BC: ['Vancouver', 'Victoria', 'Burnaby'],
    JAL: ['Guadalajara', 'Puerto Vallarta', 'Zapopan'],
    CDMX: ['Mexico City'],
    NL: ['Monterrey', 'San Pedro Garza García', 'Apodaca'],
    SP: ['São Paulo', 'Campinas', 'Guarulhos'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Contagem'],
    ENG: ['London', 'Manchester', 'Birmingham'],
    SCT: ['Glasgow', 'Edinburgh'],
    WLS: ['Cardiff', 'Swansea'],
    IDF: ['Paris', 'Versailles'],
    PACA: ['Marseille', 'Nice'],
    ARA: ['Lyon', 'Grenoble'],
    SG: ['Singapore'],
};
