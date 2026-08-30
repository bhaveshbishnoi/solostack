import { BusinessTemplate, getBusinessFlowType } from '../../types';
import { taxiTemplate } from './taxi';
import { hotelTemplate } from './hotel';
import { schoolTemplate } from './school';
import { coachingTemplate } from './coaching';
import { payrollTemplate } from './payroll';
import { gymTemplate } from './gym';
import { hospitalTemplate } from './hospital';
import { retailTemplate } from './retail';
import { wholesaleTemplate } from './wholesale';
import { pharmacyTemplate } from './pharmacy';
import { servicesTemplate } from './services';
import { manufacturingTemplate } from './manufacturing';

export {
  taxiTemplate,
  hotelTemplate,
  schoolTemplate,
  coachingTemplate,
  payrollTemplate,
  gymTemplate,
  hospitalTemplate,
  retailTemplate,
  wholesaleTemplate,
  pharmacyTemplate,
  servicesTemplate,
  manufacturingTemplate,
};

export const ALL_BUSINESS_TEMPLATES: BusinessTemplate[] = [
  taxiTemplate,
  hotelTemplate,
  schoolTemplate,
  coachingTemplate,
  payrollTemplate,
  gymTemplate,
  hospitalTemplate,
  retailTemplate,
  wholesaleTemplate,
  pharmacyTemplate,
  servicesTemplate,
  manufacturingTemplate,
];

export function getAllBusinessTemplates(): BusinessTemplate[] {
  return ALL_BUSINESS_TEMPLATES;
}

export function getBusinessTemplate(flowOrName?: string): BusinessTemplate {
  const flowType = getBusinessFlowType(flowOrName);
  const found = ALL_BUSINESS_TEMPLATES.find((t) => t.id === flowType);
  return found || retailTemplate;
}
