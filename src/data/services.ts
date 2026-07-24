import sofaImg from '../assets/images/sofa_before_after_1784161352236.jpg';
import mattressImg from '../assets/images/mattress_clean_1784161364825.jpg';
import carImg from '../assets/images/car_seat_clean_1784161376235.jpg';
import machineImg from '../assets/images/cleaning_machine_1784161387566.jpg';
import waterproofingImg from '../assets/images/waterproofing_fabric_1784327420284.jpg';
export const TECHNICIAN_PHOTO = "https://lh3.googleusercontent.com/d/1ou1DTcmpoZf9BT1UOHv3dPKceEW1EmY4";
export const OWNER_PHONE_RAW = "5511974647356";
export const OWNER_PHONE_DISPLAY = "(11) 97464-7356";
export const OWNER_EMAIL = "Iccleanjdi@gmail.com";
import { Service, BeforeAfterImage } from '../types';

export const SERVICES: Service[] = [
  {
    id: 'sofa',
    name: 'Higienização de Sofás',
    description: 'Remoção profunda de ácaros, fungos, bactérias e manchas difíceis do seu estofado, recuperando o aspecto de novo.',
    price: 'A partir de R$ 150,00',
    image: sofaImg,
    benefits: [
      'Eliminação de odores e manchas',
      'Remoção de ácaros e alérgenos',
      'Secagem rápida e segura',
      'Proteção contra novas sujidades'
    ]
  },
  {
    id: 'mattress',
    name: 'Higienização de Colchões',
    description: 'Durma com mais saúde e bem-estar. Tratamento antialérgico completo para colchões de todos os tamanhos.',
    price: 'A partir de R$ 120,00',
    image: mattressImg,
    benefits: [
      'Ação bactericida e fungicida',
      'Prevenção de crises alérgicas',
      'Remoção de suor e descamação de pele',
      'Apropriado para bebês e pets'
    ]
  },
  {
    id: 'car_seats',
    name: 'Higienização de Bancos de Carro',
    description: 'Limpeza e desinfecção completa do estofamento automotivo, resgatando o brilho e frescor do seu veículo.',
    price: 'A partir de R$ 100,00',
    image: carImg,
    benefits: [
      'Limpeza de manchas de uso diário',
      'Revitalização do tecido ou couro',
      'Ambiente interno muito mais agradável',
      'Valorização do veículo'
    ]
  },
  {
    id: 'waterproofing',
    name: 'Impermeabilização de Estofados',
    description: 'Aplicação de resina protetora de alto desempenho que impede a penetração de líquidos, sujeiras e manchas cotidianas sem alterar a textura original do tecido.',
    price: 'Sob Consulta',
    image: waterproofingImg,
    benefits: [
      'Bloqueio eficaz contra líquidos (água, sucos, café)',
      'Mantém o toque macio e a cor original do tecido',
      'Proteção ativa contra ácaros, fungos e mofo',
      'Tecnologia segura e atóxica para pets e crianças'
    ]
  }
];

export const BEFORE_AFTER_IMAGES: BeforeAfterImage[] = [
  {
    title: 'Sofá de Linho Cinza',
    beforeUrl: sofaImg,
    afterUrl: sofaImg, // Will use a visual CSS slider effect or custom UI comparison
    description: 'Remoção de manchas de café e poeira acumulada após 3 anos de uso contínuo.'
  },
  {
    title: 'Impermeabilização Pro',
    beforeUrl: sofaImg,
    afterUrl: waterproofingImg,
    beforeLabel: 'Sem Impermeabilização (Absorve)',
    afterLabel: 'Com Impermeabilização (Efeito Lótus)',
    description: 'Nossa resina protetora de alto desempenho impede que líquidos e sujeiras penetrem nas fibras do sofá. A água ou outros líquidos derramados formam gotículas perfeitas sobre o tecido, facilitando a limpeza rápida com apenas um papel toalha.'
  },
  {
    title: 'Bancos de Couro Automotivo',
    beforeUrl: carImg,
    afterUrl: carImg,
    description: 'Hidratação profunda e remoção de encardido escuro, recuperando a textura original.'
  },
  {
    title: 'Colchão de Casal Queen',
    beforeUrl: mattressImg,
    afterUrl: mattressImg,
    description: 'Remoção completa de manchas amareladas e desinfecção profunda antiácaro.'
  }
];
