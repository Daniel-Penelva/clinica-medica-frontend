import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

/**
 * Interface para representar a resposta da API ViaCEP.
 */
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // nome da cidade no ViaCEP
  uf: string;
  erro?: boolean; // presente quando o CEP nao existe
}

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private http = inject(HttpClient);

  /**
   * Busca informações de endereço a partir de um CEP utilizando a API ViaCEP.
   * Retorna null se o CEP for inválido, inexistente ou se ocorrer algum erro na requisição.
   * 
   * @param cep O CEP a ser consultado
   * @return Um Observable que emite os dados do endereço ou null em caso de erro ou CEP inexistente
  */
  buscar(cep: string): Observable<ViaCepResponse | null> {
    
    const cepLimpo = cep.replace(/\D/g, ''); // Remove caracteres não numéricos (hifen, espaços, etc.)

    if (cepLimpo.length !== 8) {
      return of(null); // Retorna null se o CEP não tiver exatamente 8 dígitos.
    }

    return this.http
      .get<ViaCepResponse>(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .pipe(
        map((response) => {
          if (response.erro) return null; // Retorna { erro: true } null para CEPs inexistentes.
          return response;
        }),
        catchError(() => of(null)), // Em caso de qualquer erro na requisição, retorna null
      );
  }
}
