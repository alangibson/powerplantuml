export class PlantUmlUrlBuilder {
  setBaseUrl(baseUrl: string): void {}

  build(): string {
    return `${this.baseUrl}/${this.umlExtension}/${this.encodedText}.${this.umlExtension}`
  }
}
