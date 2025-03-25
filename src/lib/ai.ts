import { supabase } from './supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit_price: number;
  box_price: number;
  units_per_box: number;
  unit_stock: number;
  box_stock: number;
  unit_weight: number | null;
  box_weight: number | null;
}

interface CompanyInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
}

const companyInfo: CompanyInfo = {
  name: "MarDelicia",
  phone: "+51 123 456 789",
  email: "ventas@mardelicia.com",
  address: "Eduardo Castex, La Pampa, Argentina",
  hours: "Lunes a Viernes: 7:00 AM - 4:00 PM, Sábados: 7:00 AM - 2:00 PM"
};

async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw error;
  }
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

function formatProductInfo(product: Product): string {
  let info = `${product.name}:\n`;
  
  if (product.description) {
    info += `${product.description}\n\n`;
  }
  
  if (product.unit_price > 0) {
    info += `Precio por unidad: ${formatPrice(product.unit_price)}`;
    if (product.unit_stock > 0) {
      info += ` (${product.unit_stock} unidades disponibles)`;
      if (product.unit_weight) {
        info += ` - ${product.unit_weight}kg por unidad`;
      }
      info += '\n';
    } else {
      info += " (Sin stock)\n";
    }
  }
  
  if (product.box_price > 0) {
    info += `Precio por caja: ${formatPrice(product.box_price)}`;
    if (product.box_stock > 0) {
      info += ` (${product.box_stock} cajas disponibles)`;
      if (product.units_per_box) {
        info += ` - ${product.units_per_box} unidades por caja`;
      }
      if (product.box_weight) {
        info += ` - ${product.box_weight}kg por caja`;
      }
      info += '\n';
    } else {
      info += " (Sin stock)\n";
    }
  }
  
  return info;
}

async function getProductsByCategory(category: string): Promise<string> {
  try {
    const products = await getProducts();
    const categoryProducts = products.filter(p => 
      p.category?.toLowerCase() === category.toLowerCase()
    );
    
    if (categoryProducts.length === 0) {
      return `No encontramos productos en la categoría "${category}". Las categorías disponibles son: Pescados, Mariscos y Pollo.`;
    }
    
    let response = `Productos en la categoría "${category}":\n\n`;
    categoryProducts.forEach(product => {
      response += formatProductInfo(product) + "\n";
    });
    
    return response;
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    throw error;
  }
}

async function searchProducts(query: string): Promise<string> {
  try {
    const products = await getProducts();
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    
    if (searchTerms.length === 0) {
      return "Por favor, proporciona más detalles sobre lo que estás buscando.";
    }

    const searchResults = products.filter(p => 
      searchTerms.some(term => 
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      )
    );
    
    if (searchResults.length === 0) {
      return "No encontré productos que coincidan con tu búsqueda. Puedes preguntarme por categorías específicas como 'Pescados', 'Mariscos' o 'Pollo'.";
    }
    
    let response = "Encontré los siguientes productos:\n\n";
    searchResults.forEach(product => {
      response += formatProductInfo(product) + "\n";
    });
    
    return response;
  } catch (error) {
    console.error("Error in searchProducts:", error);
    throw error;
  }
}

function getCategories(): string {
  return "Nuestras categorías disponibles son:\n" + 
    "- Pescados\n" +
    "- Mariscos\n" +
    "- Pollo";
}

function getContactInfo(): string {
  return `Puedes contactarnos de las siguientes formas:\n
- Teléfono: ${companyInfo.phone}
- Email: ${companyInfo.email}
- Dirección: ${companyInfo.address}
- Horario de atención: ${companyInfo.hours}`;
}

function getDeliveryInfo(): string {
  return `Información sobre entregas:\n
- Realizamos entregas el mismo día para pedidos antes de las 12:00 PM
- Garantizamos la frescura de todos nuestros productos
- Entregamos en toda la zona de La Pampa
- Utilizamos vehículos refrigerados para mantener la cadena de frío

Para más detalles sobre la entrega o para coordinar un horario específico, por favor contacta con nuestro equipo de ventas.`;
}

function getQualityInfo(): string {
  return `Nuestro compromiso con la calidad:\n
- Todos nuestros productos son seleccionados cuidadosamente
- Trabajamos con proveedores certificados
- Mantenemos estrictos controles de calidad
- Garantizamos la frescura de todos nuestros productos
- Contamos con certificaciones ISO 9001 y HACCP
- Cumplimos con todas las normativas sanitarias vigentes`;
}

export async function getAIResponse(userMessage: string): Promise<string> {
  const message = userMessage.toLowerCase();
  
  try {
    console.log("Processing message:", message);

    // Greeting patterns
    if (message.match(/^(hola|buenos días|buenas|hi|hello)/)) {
      return "¡Hola! Soy el asistente virtual de MarDelicia. Puedo ayudarte con:\n\n" +
        "- Información de productos y precios\n" +
        "- Consultar stock disponible\n" +
        "- Detalles de entregas\n" +
        "- Información de contacto\n\n" +
        "¿En qué puedo ayudarte hoy?";
    }

    // Stock queries
    if (message.includes("stock") || 
        message.includes("disponible") || 
        message.includes("hay") || 
        message.includes("tienen") || 
        message.includes("quedan")) {
      const productQuery = message
        .replace(/stock|disponible|hay|tienen|quedan|disponibilidad|\?/g, '')
        .trim();

      if (!productQuery) {
        return "¿Sobre qué producto deseas consultar el stock? Puedes preguntarme por cualquier producto específico.";
      }

      const products = await getProducts();
      const searchTerms = productQuery.split(/\s+/).filter(term => term.length > 2);
      
      const matchingProducts = products.filter(p => 
        searchTerms.some(term => 
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        )
      );

      if (matchingProducts.length === 0) {
        return `No encontré productos que coincidan con "${productQuery}". ¿Podrías especificar el producto que buscas?`;
      }

      let response = "Aquí está la información de stock:\n\n";
      matchingProducts.forEach(product => {
        response += `${product.name}:\n`;
        if (product.unit_stock > 0) {
          response += `- ${product.unit_stock} unidades disponibles`;
          if (product.unit_weight) {
            response += ` (${product.unit_weight}kg por unidad)`;
          }
          response += '\n';
        }
        if (product.box_stock > 0) {
          response += `- ${product.box_stock} cajas disponibles`;
          if (product.units_per_box) {
            response += ` (${product.units_per_box} unidades por caja)`;
          }
          if (product.box_weight) {
            response += ` (${product.box_weight}kg por caja)`;
          }
          response += '\n';
        }
        if (product.unit_stock === 0 && product.box_stock === 0) {
          response += "- Sin stock disponible actualmente\n";
        }
        response += '\n';
      });
      return response;
    }

    // Price queries
    if (message.includes("precio") || 
        message.includes("cuesta") || 
        message.includes("vale") || 
        message.includes("cuanto") || 
        message.includes("cuánto")) {
      const productQuery = message
        .replace(/precio|cuesta|vale|cuanto|cuánto|costo|\?/g, '')
        .trim();

      if (!productQuery) {
        return "¿Sobre qué producto deseas conocer el precio? Puedes preguntarme por cualquier producto específico.";
      }

      return await searchProducts(productQuery);
    }

    // Category queries
    if (message.includes("categoría") || 
        message.includes("categoria") || 
        message.includes("tipos de") || 
        message.includes("productos de")) {
      const category = message
        .replace(/categoría|categoria|tipos de|productos de|\?/g, '')
        .trim();

      if (!category) {
        return getCategories();
      }

      return await getProductsByCategory(category);
    }

    // List categories
    if (message.includes("categorías") || 
        message.includes("categorias") || 
        message.includes("tipos de productos")) {
      return getCategories();
    }

    // Contact information
    if (message.includes("contacto") || 
        message.includes("teléfono") || 
        message.includes("email") || 
        message.includes("correo") || 
        message.includes("dirección") ||
        message.includes("ubicación")) {
      return getContactInfo();
    }

    // Delivery information
    if (message.includes("entrega") || 
        message.includes("envío") || 
        message.includes("delivery") || 
        message.includes("envios") ||
        message.includes("reparto")) {
      return getDeliveryInfo();
    }

    // Quality and certifications
    if (message.includes("calidad") || 
        message.includes("certificación") || 
        message.includes("garantía") || 
        message.includes("fresco") ||
        message.includes("certificado")) {
      return getQualityInfo();
    }

    // Hours of operation
    if (message.includes("horario") || 
        message.includes("hora") || 
        message.includes("abierto") || 
        message.includes("atienden")) {
      return `Nuestro horario de atención es: ${companyInfo.hours}`;
    }

    // Try to find products if no specific pattern matches
    const searchResponse = await searchProducts(message);
    if (!searchResponse.includes("No encontré productos")) {
      return searchResponse;
    }

    // Default response if no matches
    return "No pude entender tu consulta. Puedo ayudarte con:\n\n" +
      "- Información de productos específicos (ej: 'precio del salmón')\n" +
      "- Consultar stock disponible (ej: 'hay salmón disponible')\n" +
      "- Ver productos por categoría (ej: 'productos de Pescados')\n" +
      "- Información de entregas y contacto\n\n" +
      "¿Podrías reformular tu pregunta?";
    
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "Lo siento, tuve un problema al procesar tu consulta. ¿Podrías intentar nuevamente?";
  }
}