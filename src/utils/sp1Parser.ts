// SP1 File Format Parser and Generator
// SEG Standard Format for Seismic Data Points

interface SP1Point {
  id: string;
  x: number;
  y: number;
  elevation?: number;
  attributes?: Record<string, any>;
}

interface SP1Header {
  version?: string;
  survey?: string;
  datum?: string;
  projection?: string;
  comments?: string[];
}

export interface SP1Data {
  header: SP1Header;
  points: SP1Point[];
}

export const parseSP1File = (content: string): SP1Data => {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  const header: SP1Header = {};
  const points: SP1Point[] = [];
  
  let inHeader = true;
  
  for (const line of lines) {
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      if (line.startsWith('#')) {
        header.comments = header.comments || [];
        header.comments.push(line.substring(1).trim());
      }
      continue;
    }
    
    // Check for header information
    if (inHeader && line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      switch (key.toLowerCase()) {
        case 'version':
          header.version = value;
          break;
        case 'survey':
          header.survey = value;
          break;
        case 'datum':
          header.datum = value;
          break;
        case 'projection':
          header.projection = value;
          break;
      }
      continue;
    }
    
    // Parse data points
    inHeader = false;
    const parts = line.split(/\s+/);
    
    if (parts.length >= 3) {
      const point: SP1Point = {
        id: parts[0],
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
      };
      
      if (parts.length > 3 && !isNaN(parseFloat(parts[3]))) {
        point.elevation = parseFloat(parts[3]);
      }
      
      // Additional attributes if present
      if (parts.length > 4) {
        point.attributes = {};
        for (let i = 4; i < parts.length; i++) {
          point.attributes[`attr${i - 3}`] = parts[i];
        }
      }
      
      points.push(point);
    }
  }
  
  return { header, points };
};

export const generateSP1Content = (data: SP1Data): string => {
  let content = '';
  
  // Add header
  if (data.header.comments) {
    content += data.header.comments.map(comment => `# ${comment}`).join('\n') + '\n';
  }
  
  if (data.header.version) content += `Version: ${data.header.version}\n`;
  if (data.header.survey) content += `Survey: ${data.header.survey}\n`;
  if (data.header.datum) content += `Datum: ${data.header.datum}\n`;
  if (data.header.projection) content += `Projection: ${data.header.projection}\n`;
  
  content += '\n';
  
  // Add data points
  for (const point of data.points) {
    let line = `${point.id}\t${point.x.toFixed(6)}\t${point.y.toFixed(6)}`;
    
    if (point.elevation !== undefined) {
      line += `\t${point.elevation.toFixed(3)}`;
    }
    
    if (point.attributes) {
      for (const value of Object.values(point.attributes)) {
        line += `\t${value}`;
      }
    }
    
    content += line + '\n';
  }
  
  return content;
};

export const convertToGeoJSON = (sp1Data: SP1Data) => {
  const features = sp1Data.points.map(point => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [point.x, point.y, point.elevation || 0]
    },
    properties: {
      id: point.id,
      elevation: point.elevation,
      ...point.attributes
    }
  }));
  
  return {
    type: 'FeatureCollection',
    features,
    crs: {
      type: 'name',
      properties: {
        name: sp1Data.header.projection || 'EPSG:4326'
      }
    }
  };
};

export const convertToCSV = (sp1Data: SP1Data): string => {
  let csv = 'ID,X,Y,Elevation';
  
  // Add attribute headers
  const allAttributes = new Set<string>();
  sp1Data.points.forEach(point => {
    if (point.attributes) {
      Object.keys(point.attributes).forEach(key => allAttributes.add(key));
    }
  });
  
  const attributeKeys = Array.from(allAttributes).sort();
  csv += attributeKeys.map(key => `,${key}`).join('');
  csv += '\n';
  
  // Add data rows
  for (const point of sp1Data.points) {
    let row = `${point.id},${point.x},${point.y},${point.elevation || ''}`;
    
    for (const key of attributeKeys) {
      row += `,${point.attributes?.[key] || ''}`;
    }
    
    csv += row + '\n';
  }
  
  return csv;
};

export const parseCSVToSP1 = (csvContent: string, header: SP1Header = {}): SP1Data => {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error('Empty CSV file');
  
  const headerLine = lines[0];
  const columns = headerLine.split(',').map(col => col.trim());
  
  // Find required columns
  const idIndex = columns.findIndex(col => /^id$/i.test(col));
  const xIndex = columns.findIndex(col => /^x$/i.test(col));
  const yIndex = columns.findIndex(col => /^y$/i.test(col));
  const elevIndex = columns.findIndex(col => /^(elevation|z)$/i.test(col));
  
  if (idIndex === -1 || xIndex === -1 || yIndex === -1) {
    throw new Error('CSV must contain ID, X, and Y columns');
  }
  
  const points: SP1Point[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(val => val.trim());
    
    if (values.length < 3) continue;
    
    const point: SP1Point = {
      id: values[idIndex],
      x: parseFloat(values[xIndex]),
      y: parseFloat(values[yIndex]),
    };
    
    if (elevIndex !== -1 && values[elevIndex] && !isNaN(parseFloat(values[elevIndex]))) {
      point.elevation = parseFloat(values[elevIndex]);
    }
    
    // Add other attributes
    const attributes: Record<string, any> = {};
    for (let j = 0; j < columns.length; j++) {
      if (j !== idIndex && j !== xIndex && j !== yIndex && j !== elevIndex) {
        if (values[j]) {
          attributes[columns[j]] = values[j];
        }
      }
    }
    
    if (Object.keys(attributes).length > 0) {
      point.attributes = attributes;
    }
    
    points.push(point);
  }
  
  return { header, points };
};