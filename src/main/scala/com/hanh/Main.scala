package com.hanh

import java.time.LocalTime

import scala.concurrent.duration._
import akka.actor.{Props, ActorRef, Actor, ActorSystem}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{TextMessage, Message}
import akka.http.scaladsl.server.Directives._
import akka.stream.{OverflowStrategy, ActorMaterializer}
import akka.stream.scaladsl.{Source, Sink, Flow}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import spray.json._

import scala.util.Random

case class Time(time: String, counter: Int, random1: Double, random2: Int)

object Marshallers extends DefaultJsonProtocol {
  implicit val timeMarshaller = jsonFormat4(Time)
}

class Exporter(port: Int) extends Actor {
  implicit val system = ActorSystem()
  implicit val materializer = ActorMaterializer()

  val in = Sink.ignore
  val out = Source.actorRef[TextMessage](1, OverflowStrategy.dropNew).mapMaterializedValue { a => self ! a }

  var subs = List.empty[ActorRef]
  def receive = {
    case sub: ActorRef => subs ::= sub
    case m: TextMessage => subs.foreach { _ ! m }
  }

  val route = path("time") {
    handleWebsocketMessages(Flow.fromSinkAndSource(in, out))
  }

  val bindingFuture = Http().bindAndHandle(route, "0.0.0.0", port)
}

class TickTick(exporter: ActorRef) extends Actor {
  import Marshallers._
  import TickTick._
  implicit val ec = context.dispatcher
  context.system.scheduler.schedule(1.second, 1.second, self, Tick)
  var c = 0
  val randGen = new Random()

  def receive = {
    case Tick =>
      val time = Time(LocalTime.now.toString, c, randGen.nextDouble(), randGen.nextInt())
      c += 1
      exporter ! TextMessage(time.toJson.compactPrint)
  }
}
object TickTick {
  case object Tick
}

object Main extends App {
  val system = ActorSystem()
  val exporter = system.actorOf(Props(new Exporter(3001)))
  val ticker = system.actorOf(Props(new TickTick(exporter)))
}
