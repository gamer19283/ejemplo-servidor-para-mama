import sys
import json

def calcular(expresion):
    try:
        permitidos = set("0123456789+-*/(). ")
        if not set(expresion).issubset(permitidos):
            return {"ok": False, "error": "Caracteres no permitidos"}

        resultado = eval(expresion, {"__builtins__": {}}, {})
        return {"ok": True, "resultado": resultado}
    except Exception as e:
        return {"ok": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "Falta la expresión"}))
        sys.exit(1)

    expresion = sys.argv[1]
    # Solo devolvemos el JSON limpio, sin textos extra
    print(json.dumps(calcular(expresion)))