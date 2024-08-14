export const invoicesBy = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Header>
        <AiqSoapHeader xmlns="http://www.visorsoftware.com/visor/accountsiq/dashboard/Integration/">
            <Entity>{{custom:entityId}}</Entity>
            <AccessToken>{{custom:accessToken}}</AccessToken>
        </AiqSoapHeader>
    </soap:Header>
    <soap:Body>
     <GetInvoicesBy xmlns="http://www.visorsoftware.com/visor/accountsiq/dashboard/Integration/">
    <query>
        <FromDate>{{query:from}}</FromDate>
        <ToDate>{{query:to}}</ToDate>
    </query>
    </GetInvoicesBy>
  </soap:Body>
</soap:Envelope>`;