<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', 'min:8', 'max:255', Rules\Password::defaults()],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Il campo nome è obbligatorio.',
            'name.string' => 'Il campo nome deve essere una stringa.',
            'name.max' => 'Il campo nome non può superare i 255 caratteri.',
            'email.required' => 'Il campo email è obbligatorio.',
            'email.string' => 'Il campo email deve essere una stringa.',
            'email.lowercase' => 'Il campo email deve essere in minuscolo.',
            'email.email' => 'Il campo email deve essere un indirizzo email valido.',
            'email.unique' => 'L\'indirizzo email è già in uso.',
            'password.confirmed' => 'Le password non coincidono.',
            'password.required' => 'Il campo password è obbligatorio.',
            'password.min' => 'La password deve essere di almeno :min caratteri.',
            'password.max' => 'La password non può superare i :max caratteri.',
        ];
    }
}
