
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Container } from "@/components/layout/Container"
import { Separator } from "@/components/ui/separator"

export default function Components() {
  return (
    <Container>
      <div className="mx-auto max-w-5xl space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Composants</h1>
          <p className="text-lg text-muted-foreground">
            Catalogue de tous les composants disponibles dans l'application
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Boutons</h2>
          <Card>
            <CardHeader>
              <CardTitle>Variants de boutons</CardTitle>
              <CardDescription>Les différents styles de boutons disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="highlight">Highlight</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <span className="h-4 w-4">+</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Champs de saisie</h2>
          <Card>
            <CardHeader>
              <CardTitle>Types d'inputs</CardTitle>
              <CardDescription>Les différents types de champs de saisie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Input standard</Label>
                  <Input type="text" placeholder="Saisir du texte..." />
                </div>
                <div className="space-y-2">
                  <Label>Input disabled</Label>
                  <Input disabled type="text" placeholder="Champ désactivé" />
                </div>
                <div className="space-y-2">
                  <Label>Input with icon</Label>
                  <div className="relative">
                    <Input type="text" placeholder="Rechercher..." className="pl-8" />
                    <span className="absolute left-2.5 top-2.5 h-5 w-5 text-gray-500">🔍</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cards</h2>
          <Card>
            <CardHeader>
              <CardTitle>Types de cards</CardTitle>
              <CardDescription>Les différents styles de cards disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Simple</CardTitle>
                    <CardDescription>Une card basique avec un header</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Contenu de la card</p>
                  </CardContent>
                </Card>
                
                <Card className="gradient-border-card">
                  <CardHeader>
                    <CardTitle>Card avec bordure gradient</CardTitle>
                    <CardDescription>Une card avec une bordure animée</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Contenu de la card</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Action</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Container>
  )
}
