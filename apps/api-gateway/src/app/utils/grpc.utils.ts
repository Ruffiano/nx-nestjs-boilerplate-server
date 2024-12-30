function transformResponse(response: any) {
  console.log(">> response: ", response);
  
  function transformField(field: any): any {
    if (field && typeof field === 'object' && 'low' in field && 'high' in field) {
      return Number(field.low);
    }

    if (Array.isArray(field)) {
      return field.map(transformField);
    }

    if (typeof field === 'object' && field !== null) {
      for (const key in field) {
        if (field.hasOwnProperty(key)) {
          field[key] = transformField(field[key]);
        }
      }
    }

    return field;
  }

  for (const key in response) {
    if (response.hasOwnProperty(key)) {
      response[key] = transformField(response[key]);
    }
  }

  return response;
}

export default transformResponse;
